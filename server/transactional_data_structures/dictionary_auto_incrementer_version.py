from transactional import Transactional


class DictionaryAutoIncrementerVersion(Transactional):
    def __init__(self, dic, key_name, id_column_name, a_i_class):
        self.dic = dic
        self.new_dic = {}
        self.key_name = key_name
        self.id_column_name = id_column_name
        self.a_i_class = a_i_class

    def get_id(self, item):
        key = getattr(item, self.key_name)

        if key in self.new_dic:
            return self.new_dic[key]

        if key in self.dic:
            return getattr(self.dic[key], self.id_column_name)

        return 1

    def get_next_id(self, item):
        key = getattr(item, self.key_name)

        if key in self.new_dic:
            result = self.new_dic[key]
            self.new_dic[key] += 1
            return result

        if key in self.dic:
            result = getattr(self.dic[key], self.id_column_name)
            self.new_dic[key] = result + 1
            return result

        self.new_dic[key] = 2
        return 1

    def clone(self):
        result = DictionaryAutoIncrementerVersion(
            self.dic,
            self.key_name,
            self.id_column_name,
            self.a_i_class
        )
        return result

    def commit(self, db):
        for key in self.new_dic.keys():
            if key in self.dic:
                setattr(self.dic[key], self.id_column_name, self.new_dic[key])
            else:
                item = self.a_i_class()
                setattr(item, self.key_name, key)
                setattr(item, self.id_column_name, self.new_dic[key])
                self.dic[key] = item

    def roll_back(self):
        self.new_dic = {}
