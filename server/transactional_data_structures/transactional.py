import inspect


class Transactional:
    def __init__(self):
        pass

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

    def commit(self, db):
        variables = [i for i in dir(self) if not inspect.ismethod(i)]
        for variable in variables:
            obj = getattr(self, variable)
            if isinstance(obj, Transactional):
                obj.commit(db)

    def roll_back(self):
        variables = [i for i in dir(self) if not inspect.ismethod(i)]
        for variable in variables:
            obj = getattr(self, variable)
            if isinstance(obj, Transactional):
                obj.roll_back()
