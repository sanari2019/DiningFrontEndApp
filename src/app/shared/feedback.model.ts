export class Feedback {
    id: number; // Assuming 'id' is a unique identifier.
    userId: number;
    experience: string;
    contactOption: boolean;
    supportType: string; // 'support', 'complaint', or 'feedback'

    constructor() {
        this.id = 0;
        this.userId = 0;
        this.experience = "experience";
        this.contactOption = false;
        this.supportType = "support";
    }
}
