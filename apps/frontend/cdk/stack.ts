import * as path from 'path';
import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

type FrontendStackProps = StackProps;
export class FrontendStack extends Stack {
    private bucket: Bucket;
    private deployment: BucketDeployment;

    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, props);

        this.bucket = new Bucket(this, 'fe-bucket', {
            bucketName: 'serverless-graphql-subscriptions-meetup',
            websiteIndexDocument: 'index.html',
            publicReadAccess: true,
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY,
            blockPublicAccess: {
                blockPublicAcls: false,
                blockPublicPolicy: false,
                restrictPublicBuckets: false,
                ignorePublicAcls: false,
            },
            cors: [{
                allowedHeaders: Cors.DEFAULT_HEADERS,
                allowedMethods: [HttpMethods.GET],
                allowedOrigins: ['*'],
            }],
        });

        this.deployment = new BucketDeployment(this, 'fe-deploy', {
            destinationBucket: this.bucket,
            sources: [Source.asset(path.join(__dirname, '..', '..', '..', 'dist', 'apps', 'frontend'))],
        });

        new CfnOutput(this, 'website', {
            description: 'Website URL',
            value: this.bucket.bucketWebsiteUrl,
        });
    }
}
