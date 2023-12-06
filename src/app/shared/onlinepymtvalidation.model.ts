// Create an Angular model to represent the transaction data
export interface OnlinePaymentValidation {
    status: boolean;
    message: string;
    data: {
        id: number;
        domain: string;
        status: string;
        reference: string;
        receipt_number: string;
        amount: number;
        message: string | null;
        gateway_response: string;
        paid_at: Date;
        created_at: Date;
        channel: string;
        currency: string;
        ip_address: string;
        metadata: {
            referrer: string;
        } | null;
        log: {
            start_time: number;
            time_spent: number;
            attempts: number;
            authentication: string;
            errors: number;
            success: boolean;
            mobile: boolean;
            input: any[];
            history: {
                type: string;
                message: string;
                time: number;
            }[];
        };
        fees: number;
        fees_split: any | null;
        authorization: {
            authorization_code: string;
            bin: string;
            last4: string;
            exp_month: string;
            exp_year: string;
            channel: string;
            card_type: string;
            bank: string;
            country_code: string;
            brand: string;
            reusable: boolean;
            signature: string;
            account_name: string | null;
            receiver_bank_account_number: string | null;
            receiver_bank: string | null;
        };
        customer: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            customer_code: string;
            phone: string;
            metadata: any | null;
            risk_action: string;
            international_format_phone: string | null;
        };
        plan: any | null;
        split: any;
        order_id: string | null;
        paidAt: string;
        createdAt: string;
        requested_amount: number;
        pos_transaction_data: any | null;
        source: any | null;
        fees_breakdown: {
            amount: number;
            formula: string | null;
            type: string;
        }[];
        transaction_date: string;
        plan_object: any;
        subaccount: any;
    };
}
