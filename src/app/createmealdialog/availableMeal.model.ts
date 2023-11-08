export class AvailableMeal {
    id: number;
    image: string;
    mealType: string;
    mealName: string;
    description: string;
    dateCreated: Date;
    createdBy: string;
    active: boolean;

    constructor() {
        // Initialize default values here if needed
        this.id = 0;
        this.image = '';
        this.mealType = '';
        this.mealName = '';
        this.description = '';
        this.dateCreated = new Date();
        this.createdBy = '';
        this.active = true;
    }
}
