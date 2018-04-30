class Enter:
    def __init__(self, lock_dic, key):
        self.lock_dic = lock_dic
        self.key = key

    def __enter__(self):
        self.lock_dic.acquire(self.key)

    def __exit__(self):
        self.lock_dic.release(self.key)
