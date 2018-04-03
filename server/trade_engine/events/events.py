from helpers.helper import binary_search
from enum import Enum


class EventReturnType(Enum):
    CONTINUE = 0
    STOP = 1
    RESTART = 2


class EventPriority(Enum):
    VALIDATION = -2
    PRE_EVENT = -1
    EVENT = 0
    POST_EVENT = 1

class EventSubscription:
    def __init__(self, sub_name, priority, func):
        self.sub_name = sub_name
        self.priority = priority
        self.func = func

    @staticmethod
    def priority_comparer(item1, item2):
        comp = 1 if item1.priority < item2.priority else -1 if item1.priority > item2.priority else 0
        if comp != 0:
            return comp
        return 1 if item1.sub_name < item2.sub_name else -1 if item1.sub_name > item2.sub_name else 0


class Events:
    def __init__(self):
        self.sub_counter = 0
        self.events = {}

    def subscribe(self, event_name, func, priority=EventPriority.EVENT, sub_name=""):
        if event_name not in self.events:
            self.events[event_name] = []

        if sub_name == "":
            sub_name = "sub_name_" + str(self.sub_counter).zfill(5)
            self.sub_counter += 1

        for event_subscription in self.events[event_name]:
            if event_subscription.sub_name == sub_name:
                raise Exception("sub_name " + sub_name + " already exists")

        new_event_subscription = EventSubscription(sub_name, priority, func)

        event_subscription_index = binary_search(self.events[event_name], new_event_subscription)

        self.events[event_name][-event_subscription_index - 1] = EventSubscription(sub_name, priority, func)

        return sub_name

    def unsubsribe(self, event_name, sub_name):
        if event_name not in self.events:
            return False

        for index in range(len(self.events[event_name])):
            if self.events[event_name][index].sub_name == sub_name:
                del self.events[event_name][index]
                return True

        return False

    def trigger(self, event_name, *args):
        if event_name not in self.events:
            return

        restart = False
        while not restart:
            for event_subscription in self.events[event_name]:
                event_return = event_subscription.func(*args)
                if event_return is None or event_return == EventReturnType.CONTINUE:
                    continue
                elif event_return == EventReturnType.STOP:
                    return False
                elif event_return == EventReturnType.RESTART:
                    restart = True
                    break

        return True
