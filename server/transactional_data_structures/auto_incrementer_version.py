from transactional import Transactional


class AutoIncrementerVersion(Transactional):
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
        result = AutoIncrementerVersion(self.obj, self.id_column_name)
        result.new_value = self.new_value
        return result

    def commit(self, db):
        setattr(self.obj, self.id_column_name, self.new_value)
        self.new_value = None

    def roll_back(self):
        self.new_value = None
