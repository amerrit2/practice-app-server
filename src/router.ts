import * as express from 'express'; // types
import { requestProcessor } from './requestProcessor';

type RequestNames = keyof typeof requestProcessor;
interface RequestInfo<N extends RequestNames> {
    name: N
    input: Parameters<(typeof requestProcessor)[N]>[0];
}

function parseApiRequest(body: any): RequestInfo<RequestNames> {
    const { requestName: name, requestInput: input } = body;
    if (!(name in requestProcessor)) {
        throw new Error(`Unrecognized request [${name}].  body.requestName must be a known request`);
    }

    return { name, input };
}

export function makeRouter() {
    const router = express.Router();

    router.get('/*', (__, res) => {
        res.send('There is no web-app here...');
    });

    router.post('/api', async (req, res) => {
        try {
            const { name, input } = parseApiRequest(req.body);
            const result = await requestProcessor[name](input);
            res.send({ payload: result });
        } catch (e) {
            res.status(e.httpStatus ?? 400).send({ error: e.message });
        }
    });

    return router;
}
