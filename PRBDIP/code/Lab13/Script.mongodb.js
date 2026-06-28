
use("prbdip_lab13");

db.people.drop();
db.vacations.drop();


db.createCollection("people");
db.createCollection("vacations");



db.people.insertMany([
    {
        _id: 1,
        fullName: "Ivan Petrov",
        age: 27,
        city: "Minsk",
        position: "Backend developer",
        salary: 2500.50,
        skills: ["Java", "SQL", "MongoDB"],
        contacts: {
            email: "ivan.petrov@mail.com",
            phone: "+375291111111"
        },
        isActive: true,
        createdAt: ISODate("2026-05-01T10:00:00Z")
    },
    {
        _id: 2,
        fullName: "Anna Volkova",
        age: 25,
        city: "Grodno",
        position: "HR manager",
        salary: 1800.00,
        skills: ["Recruiting", "Communication"],
        contacts: {
            email: "anna.volkova@mail.com"
        },
        isActive: true,
        createdAt: ISODate("2026-05-03T12:00:00Z")
    },
    {
        _id: 3,
        fullName: "Maksim Orlov",
        age: 31,
        city: "Minsk",
        position: "QA engineer",
        salary: 2100.75,
        skills: ["Testing", "SQL", "Postman"],
        contacts: {
            email: "maksim.orlov@mail.com",
            phone: "+375292222222"
        },
        isActive: false,
        createdAt: ISODate("2026-05-05T09:30:00Z")
    },
    {
        _id: 4,
        fullName: "Elena Sidorova",
        age: 29,
        city: "Brest",
        position: "Frontend developer",
        salary: 2300.20,
        skills: ["JavaScript", "React", "CSS"],
        contacts: {
            email: "elena.sidorova@mail.com"
        },
        isActive: true,
        createdAt: ISODate("2026-05-07T14:20:00Z")
    }
]);




db.vacations.insertMany([
    {
        _id: 1,
        personId: 1,
        type: "regular",
        startDate: ISODate("2026-05-12T00:00:00Z"),
        endDate: ISODate("2026-05-19T00:00:00Z"),
        days: 8,
        payment: 880.40,
        status: "approved",
        tags: ["spring", "paid"],
        comment: "First vacation"
    },
    {
        _id: 2,
        personId: 2,
        type: "long",
        startDate: ISODate("2026-06-03T00:00:00Z"),
        endDate: ISODate("2026-06-16T00:00:00Z"),
        days: 14,
        payment: 1600.75,
        status: "approved",
        tags: ["summer", "paid"]
    },
    {
        _id: 3,
        personId: 3,
        type: "short",
        startDate: ISODate("2026-07-01T00:00:00Z"),
        endDate: ISODate("2026-07-07T00:00:00Z"),
        days: 7,
        payment: 790.20,
        status: "pending",
        tags: ["summer", "paid", "short"]
    },
    {
        _id: 4,
        personId: 1,
        type: "short",
        startDate: ISODate("2026-08-10T00:00:00Z"),
        endDate: ISODate("2026-08-15T00:00:00Z"),
        days: 6,
        payment: 640.10,
        status: "rejected",
        tags: ["summer", "unpaid", "short"]
    }
]);



db.people.updateOne(
    { _id: 2 },
    { $set: { city: "Minsk", salary: 1950.00 } }
);

db.people.updateMany(
    { city: "Minsk" },
    { $set: { office: "Minsk office" } }
);

db.vacations.updateOne(
    { _id: 3 },
    { $set: { status: "approved" }, $push: { tags: "approved_after_check" } }
);



print("People with salary greater than 2000:");
db.people.find({ salary: { $gt: 2000 } });

print("Vacations from 7 to 14 days:");
db.vacations.find({ days: { $gte: 7, $lte: 14 } });

print("Approved or pending:");
db.vacations.find({ status: { $in: ["approved", "pending"] } });



print("People with SQL:");
db.people.find({ skills: "SQL" });

print("Vacations with summer and paid:");
db.vacations.find({ tags: { $all: ["summer", "paid"] } });

print("People with 3 skills:");
db.people.find({ skills: { $size: 3 } });



print("People with phone:");
db.people.find({ "contacts.phone": { $exists: true } });

print("People with double type:");
db.people.find({ salary: { $type: "double" } });

print("People with  'ov':");
db.people.find({ fullName: { $regex: "ov(a)?$", $options: "i" } });



print("Projection");
db.people.find(
    {},
    { _id: 0, fullName: 1, city: 1 }
);

print("Projection");
db.vacations.find(
    {},
    { _id: 0, personId: 1, startDate: 1, endDate: 1, payment: 1 }
);



print("All people count:");
db.people.count();

print("People from Minsk count:");
db.people.count({ city: "Minsk" });



print("First two people:");
db.people.find().sort({ _id: 1 }).limit(2);

print("Skip one person and show two:");
db.people.find().sort({ _id: 1 }).skip(1).limit(2);



print("Distinct cities:");
db.people.distinct("city");

print("Distinct vacation statuses:");
db.vacations.distinct("status");

print("Distinct vacation types for approved vacations:");
db.vacations.distinct("type", { status: "approved" });



print("Aggregate with empty match: totals by vacation status:");
db.vacations.aggregate([
    { $match: {} },
    {
        $group: {
            _id: "$status",
            vacationCount: { $sum: 1 },
            totalDays: { $sum: "$days" },
            totalPayment: { $sum: "$payment" }
        }
    },
    { $sort: { _id: 1 } }
]);



print("Aggregate with non-empty match: totals by person and vacation type:");
db.vacations.aggregate([
    { $match: { status: "approved" } },
    {
        $group: {
            _id: {
                personId: "$personId",
                type: "$type"
            },
            vacationCount: { $sum: 1 },
            totalDays: { $sum: "$days" },
            totalPayment: { $sum: "$payment" }
        }
    },
    { $sort: { "_id.personId": 1, "_id.type": 1 } }
]);



print("Aggregate: vacations with person names:");
db.vacations.aggregate([
    {
        $lookup: {
            from: "people",
            localField: "personId",
            foreignField: "_id",
            as: "person"
        }
    },
    { $unwind: "$person" },
    {
        $project: {
            _id: 0,
            vacationId: "$_id",
            personName: "$person.fullName",
            type: 1,
            status: 1,
            days: 1,
            payment: 1
        }
    },
    { $sort: { vacationId: 1 } }
]);
