export class MealActivity {
    id: number;
    availableMealId: number;
    madeActiveDate: Date;
    madeActiveBy: string;
    madeInactiveDate: Date;
    madeInactiveBy: string;

    constructor() {
        this.id = 0;
        this.availableMealId = 0;
        this.madeActiveDate = new Date();
        this.madeActiveBy = '';
        this.madeInactiveDate = new Date();
        this.madeInactiveBy = '';
    }
}
