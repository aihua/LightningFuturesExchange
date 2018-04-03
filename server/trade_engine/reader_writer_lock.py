import threading


class ThreadSafeDict(dict) :
    def __init__(self, * p_arg, ** n_arg) :
        dict.__init__(self, * p_arg, ** n_arg)
        self._lock = threading.Lock()

    def __enter__(self):
        self._lock.acquire()
        return self

    def __exit__(self, type, value, traceback):
        self._lock.release()


class ReadEnter:
    def __init__(self, reader_writer_lock_dic, key):
        self.reader_writer_lock_dic = reader_writer_lock_dic
        self.key = key

    def __enter__(self):
        self.reader_writer_lock_dic.acquire_read(self.key)

    def __exit__(self):
        self.reader_writer_lock_dic.release_read(self.key)


class WriteEnter:
    def __init__(self, reader_writer_lock_dic, key):
        self.reader_writer_lock_dic = reader_writer_lock_dic
        self.key = key

    def __enter__(self):
        self.reader_writer_lock_dic.acquire_write(self.key)

    def __exit__(self):
        self.reader_writer_lock_dic.release_write(self.key)


class ReaderWriterLockDic:

    def __init__(self):
        self._dic = ThreadSafeDict()

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
        if key not in self._dic:
            with self._dic as dic:
                dic[key] = ReaderWriterLock()

        dic[key].release_read()

    def acquire_write(self, key):
        if key not in self._dic:
            with self._dic as dic:
                dic[key] = ReaderWriterLock()

        dic[key].acquire_write()

    def release_write(self, key):
        if key not in self._dic:
            with self._dic as dic:
                dic[key] = ReaderWriterLock()

        dic[key].release_write()


class ReaderWriterLock:
    DEBUG = 0

    def __init__(self):
        self.lock = threading.Lock()

        self.active_writer_lock = threading.Lock()
        # The total number of writers including the active writer and
        # those blocking on active_writer_lock or readers_finished_cond.
        self.writer_count = 0

        # Number of events that are blocking on writers_finished_cond.
        self.waiting_reader_count = 0

        # Number of events currently using the resource.
        self.active_reader_count = 0

        self.readers_finished_cond = threading.Condition(self.lock)
        self.writers_finished_cond = threading.Condition(self.lock)

        class _ReadAccess:
            def __init__(self, rwlock):
                self.rwlock = rwlock

            def __enter__(self):
                self.rwlock.acquire_read()
                return self.rwlock

            def __exit__(self, type, value, tb):
                self.rwlock.release_read()

        # support for the with statement
        self.read_access = _ReadAccess(self)

        class _WriteAccess:
            def __init__(self, rwlock):
                self.rwlock = rwlock

            def __enter__(self):
                self.rwlock.acquire_write()
                return self.rwlock

            def __exit__(self, type, value, tb):
                self.rwlock.release_write()
        # support for the with statement
        self.write_access = _WriteAccess(self)

        if self.DEBUG:
            self.active_readers = set()
            self.active_writer = None

    def acquire_read(self):
        with self.lock:
            if self.DEBUG:
                me = threading.currentThread()
                assert me not in self.active_readers, 'This thread has already acquired read access and this lock isn\'t reader-reentrant!'
                assert me != self.active_writer, 'This thread already has write access, release that before acquiring read access!'
                self.active_readers.add(me)
            if self.writer_count:
                self.waiting_reader_count += 1
                self.writers_finished_cond.wait()
                # Even if the last writer thread notifies us it can happen that a new
                # incoming writer thread acquires the lock earlier than this reader
                # thread so we test for the writer_count after each wait()...
                # We also protect ourselves from spurious wakeups that happen with some POSIX libraries.
                while self.writer_count:
                    self.writers_finished_cond.wait()
                self.waiting_reader_count -= 1
            self.active_reader_count += 1

    def release_read(self):
        with self.lock:
            if self.DEBUG:
                me = threading.currentThread()
                assert me in self.active_readers, 'Trying to release read access when it hasn\'t been acquired by this thread!'
                self.active_readers.remove(me)
            assert self.active_reader_count > 0
            self.active_reader_count -= 1
            if not self.active_reader_count and self.writer_count:
                self.readers_finished_cond.notifyAll()

    def acquire_write(self):
        with self.lock:
            if self.DEBUG:
                me = threading.currentThread()
                assert me not in self.active_readers, 'This thread already has read access - release that before acquiring write access!'
                assert me != self.active_writer, 'This thread already has write access and this lock isn\'t writer-reentrant!'
            self.writer_count += 1
            if self.active_reader_count:
                self.readers_finished_cond.wait()
                while self.active_reader_count:
                    self.readers_finished_cond.wait()

        self.active_writer_lock.acquire()
        if self.DEBUG:
            self.active_writer = me

    def release_write(self):
        if not self.DEBUG:
            self.active_writer_lock.release()
        with self.lock:
            if self.DEBUG:
                me = threading.currentThread()
                assert me == self.active_writer, 'Trying to release write access when it hasn\'t been acquired by this thread!'
                self.active_writer = None
                self.active_writer_lock.release()
            assert self.writer_count > 0
            self.writer_count -= 1
            if not self.writer_count and self.waiting_reader_count:
                self.writers_finished_cond.notifyAll()

    def get_state(self):
        with self.lock:
            return self.writer_count, self.waiting_reader_count, self.active_reader_count