declare module 'encore.dev/api' {
  export function api<Req, Resp>(
    config: any,
    handler: (req: Req) => Promise<Resp>
  ): (req: Req) => Promise<Resp>;
  
  export class APIError extends Error {
    static notFound(message: string): APIError;
  }
}
