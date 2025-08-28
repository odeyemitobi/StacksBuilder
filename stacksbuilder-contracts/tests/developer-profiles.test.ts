import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/clarinet-js-sdk
*/

describe("Developer Profiles Contract", () => {
  it("should allow creating a new profile", () => {
    const { result } = simnet.callPublicFn(
      "developer-profiles-v2",
      "create-profile",
      [
        Cl.stringAscii("John Doe"),
        Cl.stringAscii("Full-stack developer passionate about blockchain"),
        Cl.stringAscii("San Francisco, CA"),
        Cl.stringAscii("https://johndoe.dev"),
        Cl.stringAscii("johndoe"),
        Cl.stringAscii("johndoe_dev"),
        Cl.stringAscii("john-doe"),
        Cl.list([
          Cl.stringAscii("JavaScript"),
          Cl.stringAscii("TypeScript"),
          Cl.stringAscii("React")
        ]),
        Cl.list([
          Cl.stringAscii("Frontend"),
          Cl.stringAscii("Smart Contracts")
        ])
      ],
      address1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should retrieve a created profile", () => {
    // First create a profile
    simnet.callPublicFn(
      "developer-profiles-v2",
      "create-profile",
      [
        Cl.stringAscii("Jane Smith"),
        Cl.stringAscii("Blockchain developer and researcher"),
        Cl.stringAscii("New York, NY"),
        Cl.stringAscii("https://janesmith.io"),
        Cl.stringAscii("janesmith"),
        Cl.stringAscii("jane_smith"),
        Cl.stringAscii("jane-smith"),
        Cl.list([
          Cl.stringAscii("Solidity"),
          Cl.stringAscii("Clarity")
        ]),
        Cl.list([
          Cl.stringAscii("Smart Contracts"),
          Cl.stringAscii("DeFi")
        ])
      ],
      address2
    );

    // Then retrieve it
    const { result } = simnet.callReadOnlyFn(
      "developer-profiles-v2",
      "get-profile",
      [Cl.principal(address2)],
      address1
    );

    // Check that we got some result (profile exists)
    expect(result).toMatchObject({
      type: "some"
    });
  });

  it("should prevent duplicate profiles", () => {
    // Create first profile
    simnet.callPublicFn(
      "developer-profiles-v2",
      "create-profile",
      [
        Cl.stringAscii("Bob Wilson"),
        Cl.stringAscii("Backend developer"),
        Cl.stringAscii("Austin, TX"),
        Cl.stringAscii(""),
        Cl.stringAscii("bobwilson"),
        Cl.stringAscii(""),
        Cl.stringAscii(""),
        Cl.list([Cl.stringAscii("Python")]),
        Cl.list([Cl.stringAscii("Backend")])
      ],
      address1
    );

    // Try to create another profile with same address
    const { result } = simnet.callPublicFn(
      "developer-profiles-v2",
      "create-profile",
      [
        Cl.stringAscii("Bob Wilson II"),
        Cl.stringAscii("Senior backend developer"),
        Cl.stringAscii("Austin, TX"),
        Cl.stringAscii(""),
        Cl.stringAscii("bobwilson2"),
        Cl.stringAscii(""),
        Cl.stringAscii(""),
        Cl.list([Cl.stringAscii("Python")]),
        Cl.list([Cl.stringAscii("Backend")])
      ],
      address1
    );

    expect(result).toBeErr(Cl.uint(102)); // ERR-PROFILE-ALREADY-EXISTS
  });

  it("should validate input parameters", () => {
    // Test empty display name
    const { result } = simnet.callPublicFn(
      "developer-profiles-v2",
      "create-profile",
      [
        Cl.stringAscii(""), // Empty display name
        Cl.stringAscii("Some bio"),
        Cl.stringAscii(""),
        Cl.stringAscii(""),
        Cl.stringAscii(""),
        Cl.stringAscii(""),
        Cl.stringAscii(""),
        Cl.list([]),
        Cl.list([])
      ],
      address1
    );

    expect(result).toBeErr(Cl.uint(103)); // ERR-INVALID-INPUT
  });

  it("should track total profiles count", () => {
    // Get initial count
    const { result: initialCount } = simnet.callReadOnlyFn(
      "developer-profiles-v2",
      "get-total-profiles",
      [],
      address1
    );

    // Create a profile
    simnet.callPublicFn(
      "developer-profiles-v2",
      "create-profile",
      [
        Cl.stringAscii("Alice Cooper"),
        Cl.stringAscii("UI/UX Designer and Frontend Developer"),
        Cl.stringAscii(""),
        Cl.stringAscii(""),
        Cl.stringAscii(""),
        Cl.stringAscii(""),
        Cl.stringAscii(""),
        Cl.list([Cl.stringAscii("Design")]),
        Cl.list([Cl.stringAscii("Frontend")])
      ],
      address1
    );

    // Check updated count
    const { result: newCount } = simnet.callReadOnlyFn(
      "developer-profiles-v2",
      "get-total-profiles",
      [],
      address1
    );

    // Verify count increased by 1
    if (initialCount.type === "uint" && newCount.type === "uint") {
      expect(newCount.value).toBe(BigInt(initialCount.value) + 1n);
    }
  });
});
