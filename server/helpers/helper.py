def binary_search(array, target, comparer):
    lower = 0
    upper = len(array) - 1
    while lower <= upper:   # use < instead of <=
        x = (lower + upper) // 2
        val = array[x]
        if comparer(val, target) == 1:
            lower = x + 1
        elif comparer(val, target) == -1:
            upper = x - 1
        else:
            return x
    return -lower - 1


def insert_sorted(array, target, comparer):
    array.insert(target, binary_search(array, target, comparer))


def comparer(item1, item2):
    return -1 if item1 > item2 else 1 if item1 < item2 else 0


def comparer_dec(item1, item2):
    return comparer(item2, item1)


def quick_sort(array, comparer):
    __quick_sort_helper(array, 0, len(array) - 1, comparer)
    return array


def __quick_sort_helper(array, first, last, comparer):
    if first < last:

        split_point = __partition(array, first, last, comparer)

        __quick_sort_helper(array, first, split_point-1, comparer)
        __quick_sort_helper(array, split_point + 1, last, comparer)


def __partition(array, first, last, comparer):
    pivot_value = array[first]

    left_mark = first+1
    right_mark = last

    done = False
    while not done:

        while left_mark <= right_mark and comparer(array[left_mark], pivot_value) >= 0:
            left_mark = left_mark + 1

        while comparer(array[right_mark], pivot_value) <= 0 and right_mark >= left_mark:
            right_mark = right_mark - 1

        if right_mark < left_mark:
            done = True
        else:
            temp = array[left_mark]
            array[left_mark] = array[right_mark]
            array[right_mark] = temp

    temp = array[first]
    array[first] = array[right_mark]
    array[right_mark] = temp

    return right_mark

