"use strict";
var models = require('../model/admin');
var mongoose = require('mongoose');
var mongo = process.env.MONGO_CONNECTION || "mongodb://localhost/hochzeit";
mongoose.connect(mongo);
exports.inviteeSchema = new mongoose.Schema({
    _id: String,
    name: String,
    contact: String,
    people: String,
    code: String,
    coming: String,
    hotelRange: String,
    hotelRequired: Boolean
});
var Map = (function () {
    function Map() {
    }
    Map.toIInviteePack = function (inviteeModel) {
        if (!inviteeModel)
            return null;
        var model = mongoose.model("invitees", exports.inviteeSchema);
        return new model({
            _id: inviteeModel.name,
            name: inviteeModel.name,
            contact: inviteeModel.contact,
            people: inviteeModel.people.join(','),
            code: inviteeModel.code,
            coming: inviteeModel.coming,
            hotelRange: inviteeModel.hotelRange,
            hotelRequired: inviteeModel.hotelRequired
        });
    };
    Map.toInviteePack = function (pack) {
        if (!pack)
            return null;
        var model = new models.InviteePack(pack.name);
        pack.people.split(',').forEach(function (_) { return model.addName(_); });
        model.code = pack.code;
        model.coming = pack.coming;
        model.contact = pack.contact;
        model.hotelRange = pack.hotelRange;
        model.hotelRequired = pack.hotelRequired;
        return model;
    };
    return Map;
}());
exports.Map = Map;
exports.repository = mongoose.model("Invitees", exports.inviteeSchema);
//# sourceMappingURL=data.js.map