from transactional import Transactional
from versioned_ordered_array import VersionedOrderedArray


class DictionaryDictionaryArrayVersion(Transactional):
    def __init__(self, dic, comparer, key_name_1, key_name_2, is_in_list=None, model_name=None, events=None, update_db=False):
        self.dic = dic
        self.comparer = comparer
        self.key_name_1 = key_name_1
        self.key_name_2 = key_name_2
        self.model_name = model_name
        self.events = events
        self.is_in_list = is_in_list
        self.update_db = update_db

        self.new_items = {}
        self.update_items = {}
        self.tomb_stone_items = {}

        if self.model_name is not None:
            if events is not None:
                events.subscribe(model_name + '_insert_item', self.insert_item)
                events.subscribe(model_name + '_update_item', self.update_item)
                events.subscribe(model_name + '_delete_item', self.delete_item)

    def insert_item(self, item):
        key1 = getattr(item, self.key_name_1)
        key2 = getattr(item, self.key_name_2)

        if key1 in self.dic and key2 in self.dic[key2]:
            if not (key1 in self.new_items and key2 in self.new_items[key1]):
                if key1 in self.tomb_stone_items and key2 in self.tomb_stone_items[key1]:
                    del self.tomb_stone_items[key1][key2]
                    if len(self.tomb_stone_items[key1]) == 0:
                        del self.tomb_stone_items[key1]

                if key1 not in self.update_items:
                    self.update_items[key1] = {}

                if key2 not in self.update_items[key1]:
                    self.update_items[key1][key2] = True
                    self.dic[key1][key2] = VersionedOrderedArray(self.dic[key1][key2].array, self.is_in_list, self.comparer, update_db=self.update_db)
        else:
            if key1 not in self.new_items:
                self.new_items[key1] = {}
            if key2 not in self.new_items[key1]:
                self.new_items[key1][key2] = True

        if key1 not in self.dic:
            self.dic[key1] = {}
        if key2 not in self.dic[key1]:
            self.dic[key1][key2] = VersionedOrderedArray([], self.is_in_list, self.comparer, update_db=self.update_db)
        self.dic[key1][key2].insert_item(item)

    def remove_item(self, item):
        key1 = getattr(item, self.key_name_1)
        key2 = getattr(item, self.key_name_2)

        if key1 not in self.dic:
            return

        if key2 not in self.dic[key1]:
            return

        if self.dic[key1][key2].get_length() == 0:
            return

        if self.dic[key1][key2].get_length() == 1:
            if key1 in self.new_items and key2 in self.new_items[key1]:
                del self.new_items[key1][key2]
                if len(self.new_items[key1]) == 0:
                    del self.new_items[key1]

                del self.dic[key1][key2]
                if len(self.dic[key1]) == 0:
                    del self.dic[key1][key2]
            else:
                if key1 not in self.tomb_stone_items:
                    self.tomb_stone_items[key1] = {}

                if key2 not in self.tomb_stone_items[key1]:
                    if not (key1 in self.update_items and key2 in self.update_items[key1]):
                        self.dic[key1][key2] = VersionedOrderedArray(self.dic[key1][key2].array, self.is_in_list,
                                                                     self.comparer, update_db=self.update_db)
                    self.tomb_stone_items[key1][key2] = True

                if key1 in self.update_items and key2 in self.update_items[key1]:
                    del self.update_items[key1][key2]
                    if len(self.update_items[key1]) == 0:
                        del self.update_items[key1]

        else:
            if not (key1 in self.new_items and key2 in self.new_items[key1]):
                if key1 not in self.update_items:
                    self.update_items[key1] = {}

                if key2 not in self.update_items[key1]:
                    self.update_items[key1][key2] = True
                    self.dic[key1][key2] = VersionedOrderedArray(self.dic[key1][key2].array, self.is_in_list, self.comparer, update_db=self.update_db)

        self.dic[key1][key2].remove_item(item)

    def update_item(self, new_item, old_item):
        self.remove_item(old_item)
        self.insert_item(new_item)

    def get_item(self, item):
        key1 = getattr(item, self.key_name_1)
        key2 = getattr(item, self.key_name_2)

        if key1 in self.dic and key2 in self.dic[key1]:
            return self.dic[key1][key2].get_item(item)
        else:
            return None

    def get_length(self, item):
        key1 = getattr(item, self.key_name_1)
        key2 = getattr(item, self.key_name_2)

        if key1 in self.dic and key2 in self.dic[key1]:
            return self.dic[key1][key2].get_length()
        else:
            return 0

    def get_index(self, item, index):
        key1 = getattr(item, self.key_name_1)
        key2 = getattr(item, self.key_name_2)

        if key1 in self.dic and key2 in self.dic[key1]:
            return self.dic[key1][key2].get_index(index)
        else:
            return -1

    def clone(self, root_name="root", root=None):
        result = DictionaryDictionaryArrayVersion(
            self.dic,
            self.comparer,
            self.key_name_1,
            self.key_name_2,
            is_in_list=self.is_in_list,
            model_name=self.model_name,
            events=None if root is None else root.events,
            update_db=self.update_db
        )
        return result

    def commit(self, db):
        for key1 in self.new_items.keys():
            dickey1 = self.dic[key1]
            newdickey1 = self.new_items[key1]
            for key2 in newdickey1.keys():
                dickey1[key2].commit(db)

        for key1 in self.update_items.keys():
            dickey1 = self.dic[key1]
            newdickey1 = self.updateitems[key1]
            for key2 in newdickey1.keys():
                dickey1[key2].commit(db)

        for key1 in self.tomb_stone_items.keys():
            dickey1 = self.dic[key1]
            newdickey1 = self.tomb_stone_items[key1]
            for key2 in newdickey1.keys():
                if self.update_db:
                    dickey1[key2].commit(db)
                del dickey1[key2]
            if len(dickey1) == 0:
                del self.dic[key1]

        self.new_items = {}
        self.tomb_stone_items = {}
        self.update_items = {}

    def roll_back(self):
        for key1 in self.new_items.keys():
            dickey1 = self.dic[key1]
            newdickey1 = self.new_items[key1]
            for key2 in newdickey1.keys():
                del dickey1[key2]
            if len(dickey1) == 0:
                del self.dic[key1]

        for key1 in self.update_items.keys():
            dickey1 = self.dic[key1]
            newdickey1 = self.updateitems[key1]
            for key2 in newdickey1.keys():
                dickey1[key2].roll_back()

        for key1 in self.tomb_stone_items.keys():
            dickey1 = self.dic[key1]
            newdickey1 = self.tomb_stone_items[key1]
            for key2 in newdickey1.keys():
                dickey1[key2].roll_back()

        self.new_items = {}
        self.tomb_stone_items = {}
        self.update_items = {}

