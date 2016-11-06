"use strict";
var models = require("../model/admin");
var data = require("../provider/data");
var GuestListService = (function () {
    function GuestListService() {
        this.repository = data.repository;
    }
    GuestListService.prototype.all = function (onFind) {
        return this.repository.find({}, function (err, res) {
            if (err)
                return onFind(err);
            var guests = new models.GuestList();
            res.map(function (_) { return data.Map.toInviteePack(_); })
                .forEach(function (_) { return guests.addInvitees(_); });
            onFind(null, guests);
        });
    };
    GuestListService.prototype.get = function (name, onFind) {
        return this.repository.findOne({ _id: name }, function (err, res) {
            if (err)
                return onFind(err);
            onFind(null, data.Map.toInviteePack(res));
        });
    };
    GuestListService.prototype.codeGen = function (pack, onDone) {
        var _this = this;
        this.repository.count({ code: pack.code }, function (err, count) {
            if (count > 0) {
                pack.generateCode();
                return _this.codeGen(pack, onDone);
            }
            onDone();
        });
    };
    GuestListService.prototype.add = function (name, people, onDone) {
        var _this = this;
        var pack = new models.InviteePack(name);
        people.split(',').forEach(function (_) { return pack.addName(_); });
        pack.hotelRequired = true;
        pack.hotelRange = "Freitag, 19.5. bis Sonntag 21.5.";
        this.codeGen(pack, function () {
            _this.repository.create(data.Map.toIInviteePack(pack), function (err) { return onDone(err); });
        });
    };
    GuestListService.prototype.edit = function (name, model, onDone) {
        this.repository.update({ _id: name }, model, function (err) { return onDone(err); });
    };
    GuestListService.prototype.getByCode = function (code, onDone) {
        this.repository.findOne({ code: code }, function (err, res) {
            onDone(err, data.Map.toInviteePack(res));
        });
    };
    GuestListService.guestList = new models.GuestList();
    return GuestListService;
}());
exports.GuestListService = GuestListService;
//# sourceMappingURL=participants.js.map