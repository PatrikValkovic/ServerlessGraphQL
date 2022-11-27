import { IRule } from 'graphql-shield';
import { NexusGenFieldTypeNames, NexusGenObjects } from '../generated/typegen';

export type ShieldFieldType<Key extends keyof NexusGenObjects> =
    Record<keyof NexusGenFieldTypeNames[Key], IRule>;
