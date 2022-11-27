import * as path from 'path';
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: path.join(__dirname, '..', 'be-graphql', 'src', 'generated', 'schema.graphql'),
    documents: [path.join(__dirname, 'src', 'definition', '**', '*.ts')],
    generates: {
        // [path.join(__dirname, 'src', 'generated', 'operations.ts')]: {
        //     plugins: [
        //         'typescript',
        //         'typescript-operations',
        //         'typed-document-node',
        //     ],
        //     config: {
        //         typesPrefix: 'gql',
        //         documentVariablePrefix: 'Gql',
        //         documentVariableSuffix: '',
        //         omitOperationSuffix: true,
        //     },
        // },
        [path.join(__dirname, 'src', 'generated', 'hooks.ts')]: {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-react-apollo',
            ],
            config: {
                typesPrefix: 'Gql',
                documentVariablePrefix: 'GqlDoc',
                documentVariableSuffix: '',
                operationResultSuffix: 'Result',
                withHooks: true,
                withMutationFn: false,
                exportFragmentSpreadSubTypes: true,
            },
        },
    },
};

export default config;
