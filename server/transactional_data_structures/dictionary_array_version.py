from transactional import Transactional
from versioned_ordered_array import VersionedOrderedArray


class DictionaryArrayVersion(Transactional):
    def __init__(self, dic, comparer, key_name, is_in_list=None, model_name=None, events=None,
                 update_db=False):
        self.dic = dic
        self.comparer = comparer
        self.key_name = key_name
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
        key = getattr(item, self.key_name)

        if key in self.dic:
            if not (key in self.new_items):
                if key in self.tomb_stone_items:
                    del self.tomb_stone_items[key]

                if key not in self.update_items:
                    self.update_items[key] = True
                    self.dic[key] = VersionedOrderedArray(self.dic[key].array, self.is_in_list, self.comparer, update_db=self.update_db)

        else:
            if key not in self.new_items:
                self.new_items[key] = True

        if key not in self.dic:
            self.dic[key] = VersionedOrderedArray([], self.is_in_list, self.comparer, update_db=self.update_db)
        self.dic[key].insert_item(item)

    def remove_item(self, item):
        key = getattr(item, self.key_name)

        if key not in self.dic:
            return

        if self.dic[key].get_length() == 0:
            return

        if self.dic[key].get_length() == 1:
            if key in self.new_items:
                del self.new_items[key]
                del self.dic[key]
            else:
                if key not in self.tomb_stone_items:
                    self.tomb_stone_items[key] = True
                    if key not in self.update_items:
                        self.dic[key] = VersionedOrderedArray(self.dic[key].array, self.is_in_list, self.comparer, update_db=self.update_db)

                if key in self.update_items:
                    del self.update_items[key]
        else:
            if not (key in self.new_items):
                if key not in self.update_items:
                    self.update_items[key] = True
                    self.dic[key] = VersionedOrderedArray(self.dic[key].array, self.is_in_list, self.comparer, update_db=self.update_db)

        self.dic[key].remove_item(item)

    def update_item(self, new_item, old_item):
        self.remove_item(old_item)
        self.insert_item(new_item)

    def get_list(self, item):
        key = getattr(item, self.key_name)

        if key in self.dic:
            return self.dic[key]
        else:
            return []

    def get_item(self, item):
        key = getattr(item, self.key_name)

        if key in self.dic:
            return self.dic[key].get_item(item)
        else:
            return None

    def clone(self, root_name="root", root=None):
        result = DictionaryArrayVersion(
            self.dic,
            self.comparer,
            self.key_name,
            is_in_list=self.is_in_list,
            model_name=self.model_name,
            events=None if root is None else root.events,
            update_db=self.update_db
        )
        return result

    def commit(self, db):
        for key in self.new_items.keys():
            self.dic[key].commit(db)

        for key in self.update_items.keys():
            self.dic[key].commit(db)

        for key in self.tomb_stone_items.keys():
            if self.update_db:
                self.dic[key].commit(db)
            del self.dic[key]

        self.new_items = {}
        self.tomb_stone_items = {}
        self.update_items = {}

    def roll_back(self):
        for key in self.new_items.keys():
            del self.dic[key]

        for key in self.update_items.keys():
            self.dic[key].roll_back()

        for key in self.tomb_stone_items.keys():
            self.dic[key].roll_back()

        self.new_items = {}
        self.tomb_stone_items = {}
        self.update_items = {}
