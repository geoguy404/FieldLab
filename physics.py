print("Hello, World!")


def printInitialized():
    return "Physics module initialized."

def calculate_test():
    return 1 + 2

def create_charges():
    pass

def calculate_force(**args):
    pass

def calculate_electric_field(charge,charge_x,charge_y,x,y):
    k = 8.99 * 10**9
    dx = x- charge_x
    dy = y- charge_y
    r = (dx**2 + dy**2) **0.5
    if r == 0:
        return (0,0)
    else:
        field_x = k * charge * dx / r**3
        field_y = k * charge * dy / r**3
        return (field_x, field_y)

print(calculate_electric_field(1e-6,0,0,1,1))

 
def calculate_total_electric_field(charges, x, y):
    total_field_x = 0
    total_field_y = 0
    for charge in charges:
        fields = calculate_electric_field(charge['charge'],charge['x'],charge['y'],x,y)
        field_x = fields[0]
        field_y = fields[1]
        total_field_x += field_x
        total_field_y += field_y
    return (total_field_x, total_field_y)

test_charges = [
    {'charge': 1e-6, 'x': -1, 'y': 0},
    {'charge': -1e-6, 'x': 1, 'y': 0},
]

print(calculate_total_electric_field(test_charges, 0, 1))