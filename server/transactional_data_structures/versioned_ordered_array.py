from transactional import Transactional
from helpers.helper import  binary_search


class VersionedOrderedArray(Transactional):
    def __init__(self, array, is_in_list, comparer, update_db=False):
        self.array = array
        self.is_in_list = is_in_list
        self.comparer = comparer
        self.tombstones = []
        self.new_items = []
        self.update_items = []
        self.update_db = update_db

    def __iter__(self):
        yield 5

    def binary_search(self, array, item):
        return binary_search(array, item, self.comparer)

    def get_tombstone_index(self, item):
        return self.binary_search(self.tombstones, item)

    def get_item_index(self, item):
        return self.binary_search(self.array, item)

    def get_update_item_index(self, item):
        return self.binary_search(self.update_items, item)

    def get_new_item_index(self, item):
        return self.binary_search(self.new_items, item)

    def insert_item(self, item):
        if self.is_in_list is not None and not self.is_in_list(item):
            return

        tomb_stone_index = self.get_tombstone_index(item)

        if tomb_stone_index >= 0:
            del self.tombstones[tomb_stone_index]
            update_index = self.get_update_item_index(item)
            self.update_items.insert(-update_index - 1, item)
        else:
            new_item_index = self.get_new_item_index(item)
            self.new_items.insert(-new_item_index - 1, item)

    def remove_item(self, item):
        index = self.get_item_index(item)
        if index >= 0:
            update_index = self.get_update_item_index(item)
            if update_index >= 0:
                del self.update_items[update_index]
            tomb_stone_index = self.get_tombstone_index(item)
            self.tombstones.insert(-tomb_stone_index - 1, item)
        else:
            new_item_index = self.get_new_item_index(item)
            if new_item_index >= 0:
                del self.new_items[new_item_index]

    def update_item(self, new_item, old_item):
        if old_item is None:
            old_item = new_item

        self.remove_item(old_item)
        self.insert_item(new_item)

    def __get_item_from_item(self, item):
        new_item_index = self.get_new_item_index(item)

        if new_item_index >= 0:
            return self.new_items[new_item_index]

        tomb_stone_index = self.get_tombstone_index(item)

        if tomb_stone_index >= 0:
            return None

        update_item_index = self.get_update_item_index(item)

        if update_item_index >= 0:
            return self.update_item[update_item_index]

        index = self.get_item_index(item)

        if index >= 0:
            return self.array[index]

        return None

    def __initialize_get_item_from_index(self, key):
        index = key

        if index >= len(self.array):
            index = len(self.array) - 1

        if len(self.array) == 0:
            new_item_index = 0
            if len(self.tombstones) == 0:
                tomb_stone_index = -1
            else:
                tomb_stone_index = 0
            actual_index = 0
        else:
            item = self.array[index]

            if len(self.new_items) == 0:
                new_item_index = -1
                if len(self.tombstones) == 0:
                    tomb_stone_index = -1
                    actual_index = index
                else:
                    tomb_stone_index = self.get_tombstone_index(item)
                    if tomb_stone_index < 0:
                        tomb_stone_index = -tomb_stone_index - 1
                    actual_index = index - tomb_stone_index
            else:
                tomb_stone_index = self.get_tombstone_index(item)
                new_item_index = -self.get_new_item_index(item) - 1
                if tomb_stone_index < 0:
                    tomb_stone_index = -tomb_stone_index - 1
                actual_index = index + new_item_index - tomb_stone_index

        if actual_index < key:
            d = 1
            tomb_stone_index += 1
            new_item_index += 1
        else:
            d = -1

        return index, actual_index, d, new_item_index, tomb_stone_index

    def __get_item_from_index(self, key):
        (index, actual_index, d, new_item_index, tomb_stone_index) = self.__initialize_get_item_from_index(key)

        while True:
            check_item = False

            if 0 <= index < len(self.array) and 0 <= new_item_index < len(self.new_items):
                cv = self.comparer(self.new_items[new_item_index], self.array[index])

                if cv == d:
                    check_item = True
                else:  # cv == -d:
                    if actual_index == key:
                        return self.new_items[new_item_index]
                    actual_index += d
                    new_item_index += d
            elif 0 <= index < len(self.array):
                check_item = True
            elif 0 <= new_item_index < len(self.new_items):
                return self.new_items[key - actual_index + new_item_index]
            else:
                return None

            if check_item:
                check_return_value = False

                if tomb_stone_index >= len(self.tombstones) or tomb_stone_index < 0:
                    if new_item_index >= len(self.new_items) or new_item_index < 0:
                        index += key - actual_index
                        actual_index = key

                    check_return_value = True
                else:
                    cvt = self.comparer(self.tombstones[tomb_stone_index], self.array[index])

                    if cvt == 0:
                        tomb_stone_index += d
                        index += d
                    else:
                        check_return_value = True

                if check_return_value:
                    if actual_index == key:
                        item = self.array[index]
                        update_item_index = self.get_update_item_index(item)
                        if update_item_index >= 0:
                            return self.update_items[update_item_index]
                        else:
                            return self.array[index]
                    actual_index += d
                    index += d

    def __getitem__(self, key):
        if isinstance(key, int):
            return self.__get_item_from_index(key)
        elif isinstance(key, slice):
            return
        else:
            return self.__get_item_from_item(key)

    def clone(self, root_name="root", root=None):
        result = VersionedOrderedArray(
            self.array,
            self.is_in_list,
            self.comparer,
            update_db=self.update_db
        )
        return result

    def commit(self, db):
        for new_item in self.new_items:
            index = binary_search(self.array, new_item)
            if self.update_db:
                db.session.add(new_item)
            self.array.insert(new_item, -index - 1)

        for update_item in self.update_items:
            index = binary_search(self.array, update_item)
            self.array[index].copy_values(update_item)

        for tombstone in self.tombstones:
            index = binary_search(self.array, tombstone)
            if self.update_db:
                db.session.remove(tombstone)
            del self.array[index]

        self.roll_back()

    def roll_back(self):
        self.new_items = []
        self.update_items = []
        self.tombstones = []