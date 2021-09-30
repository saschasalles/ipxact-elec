# print(int(hex(10), 16))
# print(hex(10))


def write_hexa(value, size):
    # 00FF => 8Ux"00FF"
    # 1 => '1'
    if size == 1:
        return "'{}'".format(int(value[-1], 16))
    else:
        return '{}Ux"'.format(size) + '{:0{padding}x}'.format(value, padding=int(size/4)) + '"'


print(write_hexa(0, 16))