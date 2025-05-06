require('dotenv').config({path : '../.env'})
import * as Happi from '@hapi/hapi';
import { Server } from '@hapi/hapi';
import { dataSource } from './src/config/db/conn';
import { employeeRoutes } from './src/routes/employeeRoutes';


async function init() {
    try {

        await dataSource.initialize();
        console.log('Database initialized successfully.');


        const server: Server = Happi.server({
            port: 3001,
            host: 'localhost',
            routes :{
                cors : {
                    origin : ["http://localhost:5173"]
                }
            }
        });


        server.route(employeeRoutes);
        await server.start();

        console.log('Server is running on:', server.info.uri);

    } catch (error) {

        console.error('Initialization error:', error);
        process.exit(1);
    }
}

process.on('unhandledRejection', (e) => {

    console.error(e);
    process.exit(1);
});


process.on('uncaughtException', (e) => {

    console.error(e);
    process.exit(1);
});

init();
