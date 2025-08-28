// Type declarations for Clarinet SDK globals
declare const simnet: {
  getAccounts(): Map<string, string>;
  callPublicFn(contractName: string, functionName: string, args: any[], sender: string): any;
  callReadOnlyFn(contractName: string, functionName: string, args: any[], sender: string): any;
};

// Extend Vitest matchers for Clarity values
declare namespace Vi {
  interface Assertion<T = any> {
    toBeOk(expected?: any): void;
    toBeErr(expected?: any): void;
    toBeUint(expected?: bigint | number): void;
    toBeBool(expected?: boolean): void;
    toBeAscii(expected?: string): void;
    toBeBuff(expected?: Uint8Array): void;
    toBeList(expected?: any[]): void;
    toBeTuple(expected?: Record<string, any>): void;
    toBePrincipal(expected?: string): void;
    toBeSome(expected?: any): void;
    toBeNone(): void;
  }
}
