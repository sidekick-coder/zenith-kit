import { describe, expect, it } from "vitest";
import { flatten, unflatten } from "./flatten";

describe('flatten.ts', () => {
    describe('flatten', () => {
        it('should flatten nested objects', () => {
            const input = {
                a: 1,
                b: {
                    c: 2,
                    d: {
                        e: 3
                    }
                }
            }

            const expected = {
                'a': 1,
                'b.c': 2,
                'b.d.e': 3
            }

            expect(flatten(input)).toEqual(expected)
        })

        it('should handle arrays correctly', () => {
            const input = {
                a: [1, 2, 3],
                b: {
                    c: [4, 5]
                }
            }

            const expected = {
                'a[0]': 1,
                'a[1]': 2,
                'a[2]': 3,
                'b.c[0]': 4,
                'b.c[1]': 5
            }

            expect(flatten(input)).toEqual(expected)
        })
    })

    describe('unflatten', () => {
        it('should unflatten flat objects into nested structures', () => {
            const input = {
                'a': 1,
                'b.c': 2,
                'b.d.e': 3
            }

            const expected = {
                a: 1,
                b: {
                    c: 2,
                    d: {
                        e: 3
                    }
                }
            }

            expect(unflatten(input)).toEqual(expected)
        })

        it('should handle array keys correctly', () => {
            const input = {
                'a[0]': 1,
                'a[1]': 2,
                'a[2]': 3,
                'b.c[0]': 4,
                'b.c[1]': 5
            }

            const expected = {
                a: [1, 2, 3],
                b: {
                    c: [4, 5]
                }
            }

            expect(unflatten(input)).toEqual(expected)
        })
    })
})
