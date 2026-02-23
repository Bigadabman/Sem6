import { Sequelize } from "sequelize";
const Model = Sequelize.Model;


class Faculty extends Model{};
class Pulpit extends Model{};
class Teacher extends Model{};
class Subject extends Model{};
class Auditorium_type extends Model{};
class Auditorium extends Model{};

function Initialize(sequelize) {

    Faculty.init(
        {
            FACULTY: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
            FACULTY_NAME: { type: Sequelize.STRING, allowNull: false }
        },
        {
            sequelize, modelName: 'FACULTY',  tableName: 'FACULTY',  timestamps: false
        });

    Pulpit.init(
        {
            PULPIT: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            PULPIT_NAME: { type: Sequelize.STRING, allowNull: false},
            FACULTY: { type: Sequelize.STRING, allowNull: false,
                        references: {model: Faculty, key: 'FACULTY'}
            }
        },
        {
            sequelize, modelName: 'PULPIT', tableName: 'PULPIT', timestamps: false
        }
    );

    Teacher.init(
        {
            TEACHER: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            TEACHER_NAME: { type: Sequelize.STRING, allowNull: false},
            PULPIT: { type: Sequelize.STRING, allowNull: false,
                        references: {model: Pulpit, key: 'pulpit'}
            }
        },
        {
            sequelize, modelName: 'TEACHER', tableName: 'TEACHER', timestamps: false
        }
    );

    Subject.init(
        {
            SUBJECT: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            SUBJECT_NAME: { type: Sequelize.STRING, allowNull: false},
            PULPIT: { type: Sequelize.STRING, allowNull: false,
                        references: {model: Pulpit, key: 'pulpit'}
            }
        },
        {
            sequelize, modelName: 'SUBJECT', tableName: 'SUBJECT', timestamps: false
        }
    );

    Auditorium_type.init(
        {
            AUDITORIUM_TYPE: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            AUDITORIUM_TYPENAME: { type: Sequelize.STRING, allowNull: false}
        },
        {
            sequelize, modelName: 'AUDITORIUM_TYPE', tableName: 'AUDITORIUM_TYPE', timestamps: false
        }
    );

    Auditorium.init(
        {
            AUDITORIUM: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            AUDITORIUM_NAME: { type: Sequelize.STRING, allowNull: false},
            AUDITORIUM_CAPACITY: { type: Sequelize.INTEGER, allowNull: false},
            AUDITORIUM_TYPE: { type: Sequelize.STRING, allowNull: false,
                        references: {model: Auditorium_type, key: 'AUDITORIUM_TYPE'}
            }
        },
        {
            sequelize, modelName: 'AUDITORIUM', tableName: 'AUDITORIUM', timestamps: false
        }
    );


}

export function ORM(sequelize){
    Initialize(sequelize);
     return {Faculty, Pulpit, Teacher, Subject, Auditorium_type, Auditorium};
    };