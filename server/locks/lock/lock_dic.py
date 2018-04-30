from locks.thread_safe_dic import ThreadSafeDic
from enter import Enter
import threading


class LockDic:
    def __init__(self):
        self._dic = ThreadSafeDic()

    def enter(self, key):
        return Enter(self, key)

    def acquire(self, key):
        if key not in self._dic:
            with self._dic as dic:
                if key not in dic:
                    dic[key] = threading.Lock()

        self._dic[key].acquire()

    def release(self, key):
        self._dic[key].release()

    def clone(self):
        return self

    def commit(self, db):
        pass

    def roll_back(self):
        pass
