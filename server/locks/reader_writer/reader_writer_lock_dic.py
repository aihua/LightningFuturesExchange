from locks.thread_safe_dic import ThreadSafeDic
from read_enter import ReadEnter
from write_enter import WriteEnter
from reader_writer_lock import ReaderWriterLock
from transactional_data_structures.transactional import Transactional


class ReaderWriterLockDic(Transactional):
    def __init__(self):
        self._dic = ThreadSafeDic()

    def read_enter(self, key):
        return ReadEnter(self, key)

    def write_enter(self, key):
        return WriteEnter(self, key)

    def acquire_read(self, key):
        if key not in self._dic:
            with self._dic as dic:
                dic[key] = ReaderWriterLock()

        dic[key].acquire_read()

    def release_read(self, key):
        self._dic[key].release_read()

    def acquire_write(self, key):
        if key not in self._dic:
            with self._dic as dic:
                if key not in dic:
                    dic[key] = ReaderWriterLock()

        self._dic[key].acquire_write()

    def release_write(self, key):
        self._dic[key].release_write()

    def clone(self):
        return self

    def commit(self, db):
        pass

    def roll_back(self):
        pass
