export class Feedback {
    id: number; // Assuming 'id' is a unique identifier.
    userId: number;
    experience: string;
    contactOption: boolean;

    constructor() {
        this.id = 0;
        this.userId = 0;
        this.experience = "experience";
        this.contactOption = false;
    }
}
