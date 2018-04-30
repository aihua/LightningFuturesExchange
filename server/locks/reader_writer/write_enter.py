class WriteEnter:
    def __init__(self, reader_writer_lock_dic, key):
        self.reader_writer_lock_dic = reader_writer_lock_dic
        self.key = key

    def __enter__(self):
        self.reader_writer_lock_dic.acquire_write(self.key)

    def __exit__(self):
        self.reader_writer_lock_dic.release_write(self.key)