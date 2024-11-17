class DayNode {
    constructor(name, price, date) {
        this.name = name;
        this.price = price;
        this.sideDishes = [];
        this.date = date;
        this.next = null;
    }
}
class Restaurant {
    constructor(name) {
        this.name = name;
        this.head = null;
        this.length = 0;
    }
    addMenu(menuName, price, sideDishes = []) {
        const today = new Date();
        const newMenu = new DayNode(menuName, price, today);
        newMenu.sideDishes = sideDishes
        newMenu.next = this.head
        this.head = newMenu;
        this.length++;
        return newMenu;
    }
    getAllTodayMenu() {
        if (!this.head) {
            return {};
        }
        return {
            name: this.head.name,
            price: this.head.price,
            sideDishes: this.head.sideDishes
        };
    }

    findMenuByDate(date) {
        let current = this.head;
        while (current) {
            if (current.date.toDateString() === date.toDateString()) {
                return current;
            }
            current = current.next;
        }
        return null;
    }
}
class CampusRestaurants {
    constructor() {
        this.restaurants = {
            myungJinDang: new Restaurant('명진당'),
            studentHall: new Restaurant('학생회관'),
            facultyHall: new Restaurant('교직원 식당'),
            welfare: new Restaurant('복지동 식당')
        };
    }
    addMenu(restaurantName, menuName, price, sideDishes = []) {
        const restaurant = this.restaurants[restaurantName];
        if (restaurant) {
            return restaurant.addMenu(menuName, price, sideDishes);
        }
        return null;
    }
    getAllTodayMenus() {
        const allMenus = {};
        for (const [key, restaurant] of Object.entries(this.restaurants)) {
            allMenus[key] = restaurant.getAllTodayMenu();
        }
        return allMenus;
    }
}

export { DayNode, Restaurant, CampusRestaurants };