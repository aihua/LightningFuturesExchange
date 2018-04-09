from transactional import Transactional


class DictionaryVersion(Transactional):
    def __init__(self, dic, key_name, model_name=None, events=None, update_db=False):
        self.dic = dic
        self.key_name = key_name
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

        if key in self.tomb_stones:
            del self.tomb_stones[key]

            if key in self.dic:
                self.update_items[key] = item
            else:
                self.new_items[key] = item
        else:
            self.new_items[key] = item

    def update_item(self, new_item, old_item):
        self.delete_item(old_item)
        self.insert_item(new_item)

    def delete_item(self, item):
        key = getattr(item, self.key_name)

        if key in self.dic:
            if key in self.update_items:
                del self.update_items[key]

            if key not in self.tomb_stones:
                self.tomb_stones[key] = item
        else:
            if key in self.new_items:
                del self.new_items[key]

    def clone(self, root_name="", root=None):
        result = DictionaryVersion(
            self.dic,
            self.key_name,
            model_name=self.model_name,
            events=None if root is None else root.events
        )
        return result

    def commit(self, db):
        for new_item in self.new_items:
            key = getattr(new_item, self.key_name)
            if self.update_db:
                db.session.add(new_item)
            self.dic[key] = new_item

        for tomb_stone in self.tomb_stones:
            key = getattr(tomb_stone, self.key_name)
            if self.update_db:
                db.session.delete(self.dic[key])
            del self.dic[key]

        for update_item in self.update_items:
            key = getattr(update_item, self.key_name)
            self.dic[key].copy_values(update_item)

        self.roll_back()

    def roll_back(self):
        self.new_items = {}
        self.tomb_stones = {}
        self.update_items = {}
