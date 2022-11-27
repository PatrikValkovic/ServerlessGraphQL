import { Repositories } from '@agora/be-data';
import { Pub, TypedPub } from '@agora/be-business-logic';

export type GqlContext = {
    repositories: Repositories;
    identifier: string;
    name: string;
    pub: Pub;
    typedPub: TypedPub;
}
