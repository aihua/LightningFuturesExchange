from transactional import Transactional


class DictionaryDictionaryVersion(Transactional):
    def __init__(self, dic, key_name_1, key_name_2, model_name=None, events=None, update_db=False):
        self.dic = dic
        self.key_name_1 = key_name_1
        self.key_name_2 = key_name_2
        self.new_items = {}
        self.tomb_stones = {}
        self.update_items = {}
        self.model_name = model_name
        self.update_db = update_db
        if model_name is not None:
            if events is not None:
                events.subscribe(model_name + '_insert_item', self.insert_item)
                events.subscribe(model_name + '_update_item', self.update_item)
                events.subscribe(model_name + '_delete_item', self.delete_item)

    def get_item(self, item):
        key_1 = getattr(item, self.key_name_1)
        key_2 = getattr(item, self.key_name_2)

        if key_1 in self.tomb_stones and key_2 in self.tomb_stones[key_1]:
            return None

        if key_1 in self.update_items and key_2 in self.update_items[key_1]:
            return self.update_items[key_1][key_2]

        if key_1 in self.new_items and key_2 in self.new_items[key_1]:
            return self.new_items[key_1][key_2]

        if key_1 in self.dic and key_2 in self.dic[key_1]:
            return self.dic[key_1][key_2]

        return None

    def insert_item(self, item):
        key_1 = getattr(item, self.key_name_1)
        key_2 = getattr(item, self.key_name_2)

        if key_1 in self.tomb_stones and key_2 in self.tomb_stones[key_1]:
            del self.tomb_stones[key_1][key_2]
            if len(self.tomb_stones[key_1]) == 0:
                del self.tomb_stones[key_1]

            if key_1 in self.dic and key_2 in self.dic[key_1]:
                if key_1 not in self.update_items:
                    self.update_items[key_1] = {}
                self.update_items[key_1][key_2] = item
            else:
                if key_1 not in self.new_items:
                    self.new_items[key_1] = {}
                self.new_items[key_1][key_2] = item
        else:
            if key_1 not in self.new_items:
                self.new_items[key_1] = {}
            self.new_items[key_1][key_2] = item

    def update_item(self, new_item, old_item):
        self.delete_item(old_item)
        self.insert_item(new_item)

    def delete_item(self, item):
        key_1 = getattr(item, self.key_name_1)
        key_2 = getattr(item, self.key_name_2)

        if key_1 in self.dic and key_2 in self.dic[key_1]:
            if key_1 in self.update_items and key_2 in self.update_items[key_1]:
                del self.update_items[key_1][key_2]
                if len(self.update_items[key_1]) == 0:
                    del self.update_items[key_1]

            if not (key_1 in self.tomb_stones and key_2 in self.tomb_stones[key_1]):
                if key_1 not in self.tomb_stones:
                    self.tomb_stones[key_1] = {}
                self.tomb_stones[key_1][key_2] = item
        else:
            if key_1 in self.new_items and key_2 in self.new_items[key_1]:
                del self.new_items[key_1][key_2]
                if len(self.new_items[key_1]) == 0:
                    del self.new_items[key_1]

    def clone(self, root_name="", root=None):
        result = DictionaryDictionaryVersion(
            self.dic,
            self.key_name_1,
            self.key_name_2,
            model_name=self.model_name,
            events=None if root is None else root.events
        )
        return result

    def commit(self, db):
        for key_1 in self.new_items.keys():
            if key_1 not in self.dic:
                self.dic[key_1] = {}

            dic_key_1 = self.dic[key_1]
            new_dic_key_1 = self.new_items[key_1]

            for key_2 in new_dic_key_1.keys():
                if self.update_db:
                    db.session.add(new_dic_key_1[key_2])
                dic_key_1[key_2] = new_dic_key_1[key_2]

        for key_1 in self.tomb_stones.keys():
            dic_key_1 = self.dic[key_1]
            new_dic_key_1 = self.tomb_stones[key_1]

            for key_2 in new_dic_key_1.keys():
                if self.update_db:
                    db.session.delete(dic_key_1[key_2])
                del dic_key_1[key_2]

            if len(dic_key_1) == 0:
                del self.dic[key_1]

        for key_1 in self.update_items.keys():
            dic_key_1 = self.dic[key_1]
            new_dic_key_1 = self.update_items[key_1]

            for key_2 in new_dic_key_1.keys():
                dic_key_1[key_2].copy_values(new_dic_key_1[key_2])

        self.roll_back()

    def roll_back(self):
        self.new_items = {}
        self.tomb_stones = {}
        self.update_items = {}