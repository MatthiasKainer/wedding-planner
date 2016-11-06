export class GuestList {
    invitees :  { [name: string] : InviteePack; };
    
    public constructor() {
        this.invitees = {};
    }
    
    public addInvitees(invitees : InviteePack) {
        this.invitees[invitees.name] = invitees;
    }
    
    public removeInvitees(name : string) {
        delete this.invitees[name];
    }
    
    public codeExists(code : any) {
        console.log(`Currently ${Object.keys(this.invitees).length} items in the queue`)
        for (var key in this.invitees) {
            let current = this.invitees[key];
            if (current.code == code) return true;
        }
        
        return false;
    }
    
    public totalPeople() {
        let total = 0;
        for (var key in this.invitees) {
            let current = this.invitees[key];
            total += current.getCount();
        }
        
        return total;
    }
    
    public totalAccepted() {
        let total = 0;
        for (var key in this.invitees) {
            let current = this.invitees[key];
            if (current.coming == AcceptanceState.COMING)
                total += current.getCount();
        }
        
        return total;        
    }
}

export var AcceptanceState = {
    UNKNOWN : "unbekannt",
    COMING : "zugesagt",
    NAYSAYERS : "absager"
}

class NumberGenerator {
    public static generate(bottom : number, top : number) {
        return Math.floor( Math.random() * ( 1 + top - bottom ) ) + bottom;
    }
}

export class InviteePack {
    name : string;
    people : string[];
    code : any;
    coming : any = AcceptanceState.UNKNOWN;
    contact : string;
    hotelRange : string;
    hotelRequired : boolean;
    
    public constructor(name : string) {
        this.name = name;
        this.people = [];
        this.generateCode();
    }
    
    public generateCode() {
        this.code = NumberGenerator.generate(10000, 99999);        
    }
    
    public addName(name : string) {
        name = name.trim();
        if (this.people.indexOf(name) <= 0)
            this.people.push(name);
        return this;
    }
    
    public removeName(name : string) {
        var index = this.people.indexOf(name);
        this.people.slice(index, 1);
        return this;
    }
    
    public accept() {
        this.coming = AcceptanceState.COMING;
        return this;
    }
    
    public nay() {
        this.coming = AcceptanceState.NAYSAYERS;
        return this;
    }
    
    public getCount() {
        return this.people.length;
    }
}