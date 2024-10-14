import Auth from "./auth";
import {Sequelize} from "sequelize";
import sequelize from "./sequelize";
import Transcoder from "./transcoder/transcoder";

export default class Service {
    declare auth: Auth;
    declare db: Sequelize;
    declare transcoder: Transcoder;

    constructor() {
        console.log("started here")
        this.auth = new Auth();

        this.db = sequelize;

        this.transcoder = new Transcoder(sequelize);
        this.transcoder.start();
    }
}
