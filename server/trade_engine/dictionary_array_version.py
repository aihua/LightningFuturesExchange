from helpers.helper import  binary_search
import inspect

class Transactional:

    def clone(self, root_name="root", root=None):
        result = self.__class__()
        if root is None:
            root = result
        variables = [i for i in dir(self) if not inspect.ismethod(i)]
        for variable in variables:
            obj = getattr(self, variable)
            if variable == root_name:
                setattr(result, variable, root)
            elif isinstance(obj, Transactional):
                setattr(obj, variable, obj.clone(root_name, root))
            else:
                setattr(result, variable, obj)
        return result

    def commit(self):
        variables = [i for i in dir(self) if not inspect.ismethod(i)]
        for variable in variables:
            obj = getattr(self, variable)
            if isinstance(obj, Transactional):
                obj.commit()

    def roll_back(self):
        variables = [i for i in dir(self) if not inspect.ismethod(i)]
        for variable in variables:
            obj = getattr(self, variable)
            if isinstance(obj, Transactional):
                obj.roll_back()


class VersionedOrderedArray:
    def __init__(self, array, is_in_list, comparer):
        self.array = array
        self.is_in_list = is_in_list
        self.comparer = comparer
        self.tombstones = []
        self.new_items = []
        self.update_items = []

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


class DictionaryArrayVersion(Transactional):
    def __init__(self, dic, comparer, key_name, is_in_list=None, model_name=None, events=None):
        self.dic = dic
        self.new_dic = {}
        self.key_name = key_name
        self.is_in_list = is_in_list
        self.comparer = comparer
        if events is not None:
            events.subscribe(model_name + '_insert_item', self.insert_item)
            events.subscribe(model_name + '_update_item', self.update_item)
            events.subscribe(model_name + '_delete_item', self.delete_item)

    def __create_if_not_created(self, key):
        if key not in self.new_dic:
            self.new_dic[key] = VersionedOrderedArray(self.dic[key], self.is_in_list, self.comparer)

    def insert_item(self, item):
        key = getattr(item, self.key_name)

        self.__create_if_not_created(key)
        self.new_dic[key].insert_item(item)

    def remove_item(self, item):
        key = getattr(item, self.key_name)

        self.__create_if_not_created(key)
        self.new_dic[key].remove_item(item)

    def update_item(self, new_item, old_item):
        key = getattr(new_item, self.key_name)

        self.__create_if_not_created(key)
        self.new_dic[key].update_item(new_item, old_item)

    def get_item(self, item):
        key = getattr(item, self.key_name)

        if key in self.new_dic:
            return self.new_dic[key][item]
        else:
            return self.dic[key][item]

    def get_index(self, item, index):
        key = getattr(item, self.key_name)

        if key in self.new_dic:
            return self.new_dic[key][index]
        else:
            return self.dic[key][index]

    def get_count(self, item):
        key = getattr(item, self.key_name)

        if key in self.new_dic:
            return self.new_dic[key].get_count()
        else:
            return len(self.dic[key])

    def clone(self):
        return

    def commit(self):
        return

    def roll_back(self):
        return


class DictionaryVersion(Transactional):
    def __init__(self, dic, key_name, model_name=None, events=None):
        self.dic = dic
        self.key_name = key_name
        self.new_items = {}
        self.tomb_stones = {}
        self.update_items = {}
        if model_name is not None:
            if events is not None:
                events.subscribe(model_name + '_insert_item', self.insert_item)
                events.subscribe(model_name + '_update_item', self.update_item)
                events.subscribe(model_name + '_delete_item', self.delete_item)

    def __create_if_not_created(self, key):
        if key not in self.new_dic:
            self.new_dic[key] = {}

    def get_item(self, item):
        key = getattr(item, self.key_name)

        if key in self.tomb_stones:
            return None

        if key in self.update_items:
            return self.update_items[key]

        if key in self.new_items:
            return self.new_items[key]

        if key in self.dic:
            return self.dic[key]

        return None

    def insert_item(self, item):
        key = getattr(item, self.key_name)

        return

    def update_item(self, new_item, old_item):
        key = getattr(item, self.key_name)

        return

    def delete_item(self, item):
        key = getattr(item, self.key_name)

        return

    def clone(self):
        return

    def commit(self):
        return

    def roll_back(self):
        return


class DictionaryDictionaryArrayVersion(Transactional):
    def __init__(self, dic, comparer, key_name_1, key_name_2, is_in_list=None, model_name=None, events=None):
        self.dic = dic
        self.comparer = comparer
        self.key_name_1 = key_name_1
        self.key_name_2 = key_name_2
        self.model_name = model_name
        self.events = events
        self.is_in_list = is_in_list

        self.new_dic = {}

        if self.model_name is not None:
            if events is not None:
                events.subscribe(model_name + '_insert_item', self.insert_item)
                events.subscribe(model_name + '_update_item', self.update_item)
                events.subscribe(model_name + '_delete_item', self.delete_item)

    def __create_if_not_created(self, key1, key2):
        if key1 not in self.new_dic:
            self.new_dic[key1] = {}

        if key2 not in self.new_dic[key1]:
            self.new_dic[key1][key2] = VersionedOrderedArray(self.dic[key1][key2], self.comparer)

    def insert_item(self, item):
        key1 = getattr(item, self.key_name_1)
        key2 = getattr(item, self.key_name_2)

        self.__create_if_not_created(key1, key2)
        self.new_dic[key1][key2].insert_item(item)

    def remove_item(self, item):
        key1 = getattr(item, self.key_name_1)
        key2 = getattr(item, self.key_name_2)

        self.__create_if_not_created(key1, key2)
        self.new_dic[key1][key2].remove_item(item)

    def update_item(self, item):
        key1 = getattr(item, self.key_name_1)
        key2 = getattr(item, self.key_name_2)

        self.__create_if_not_created(key1, key2)
        self.new_dic[key1][key2].update_item(item)

    def get_item(self, item):
        key1 = getattr(item, self.key_name_1)
        key2 = getattr(item, self.key_name_2)

        if key1 in self.new_dic and key2 in self.new_dic[key1]:
            return self.new_dic[key1][key2][item]
        else:
            return self.dic[key1][key2][item]

    def clone(self, root_name="root", root=None):
        result = DictionaryDictionaryArrayVersion(
            self.dic,
            self.comparer,
            self.key_name_1,
            self.key_name_2,
            is_in_list=self.is_in_list,
            model_name=self.model_name,
            events=None if root is None else root.events
        )

        return result


    def commit(self):
        return

    def roll_back(self):
        return


class DictionaryAutoIncrementerVersion(Transactional):
    def __init__(self, obj, id_column_name):
        self.obj = obj
        self.new_value = None
        self.id_column_name = id_column_name

    def get_id(self):
        if self.new_value is not None:
            return self.new_value
        return getattr(self.obj, self.id_column_name)

    def get_next_id(self):
        if self.new_value is None:
            self.new_value = getattr(self.obj, self.id_column_name)
        result = self.new_value
        self.new_value += 1
        return result

    def clone(self):
        result = DictionaryAutoIncrementerVersion(self.obj, self.id_column_name)
        result.new_value = self.new_value
        return result

    def commit(self):
        setattr(self.obj, self.id_column_name, self.new_value)
        self.new_value = None

    def roll_back(self):
        self.new_value = None
