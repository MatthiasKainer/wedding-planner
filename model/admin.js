"use strict";
var GuestList = (function () {
    function GuestList() {
        this.invitees = {};
    }
    GuestList.prototype.addInvitees = function (invitees) {
        this.invitees[invitees.name] = invitees;
    };
    GuestList.prototype.removeInvitees = function (name) {
        delete this.invitees[name];
    };
    GuestList.prototype.codeExists = function (code) {
        console.log("Currently " + Object.keys(this.invitees).length + " items in the queue");
        for (var key in this.invitees) {
            var current = this.invitees[key];
            if (current.code == code)
                return true;
        }
        return false;
    };
    GuestList.prototype.totalPeople = function () {
        var total = 0;
        for (var key in this.invitees) {
            var current = this.invitees[key];
            total += current.getCount();
        }
        return total;
    };
    GuestList.prototype.totalAccepted = function () {
        var total = 0;
        for (var key in this.invitees) {
            var current = this.invitees[key];
            if (current.coming == exports.AcceptanceState.COMING)
                total += current.getCount();
        }
        return total;
    };
    return GuestList;
}());
exports.GuestList = GuestList;
exports.AcceptanceState = {
    UNKNOWN: "unbekannt",
    COMING: "zugesagt",
    NAYSAYERS: "absager"
};
var NumberGenerator = (function () {
    function NumberGenerator() {
    }
    NumberGenerator.generate = function (bottom, top) {
        return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
    };
    return NumberGenerator;
}());
var InviteePack = (function () {
    function InviteePack(name) {
        this.coming = exports.AcceptanceState.UNKNOWN;
        this.name = name;
        this.people = [];
        this.generateCode();
    }
    InviteePack.prototype.generateCode = function () {
        this.code = NumberGenerator.generate(10000, 99999);
    };
    InviteePack.prototype.addName = function (name) {
        name = name.trim();
        if (this.people.indexOf(name) <= 0)
            this.people.push(name);
        return this;
    };
    InviteePack.prototype.removeName = function (name) {
        var index = this.people.indexOf(name);
        this.people.slice(index, 1);
        return this;
    };
    InviteePack.prototype.accept = function () {
        this.coming = exports.AcceptanceState.COMING;
        return this;
    };
    InviteePack.prototype.nay = function () {
        this.coming = exports.AcceptanceState.NAYSAYERS;
        return this;
    };
    InviteePack.prototype.getCount = function () {
        return this.people.length;
    };
    return InviteePack;
}());
exports.InviteePack = InviteePack;
//# sourceMappingURL=admin.js.map