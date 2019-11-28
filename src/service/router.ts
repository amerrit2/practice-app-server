import express from 'express'; // types
import { requestProcessor } from './requestProcessor';
import { validateRequest } from './service_schema';

export function makeRouter() {
    const router = express.Router();

    router.get('/*', (__, res) => {
        res.send('There is no web-app here...');
    });

    router.post('/api', async (req, res) => {
        try {
            const { requestName, requestInput } = validateRequest(req.body);
            // todo solve this any
            const result = await (requestProcessor[requestName] as any)(requestInput);
            res.send({ payload: result });
        } catch (e) {
            res.status(e.httpStatus ?? 400).send({ error: e.message });
        }
    });

    return router;
}
