export type PlanType = 'free' | 'basic' | 'professional' | 'master' | 'business';

interface PlanLimit {
    maxUsers: number;
    maxObras: number;
    maxCredits: number;
    unlimitedObras: boolean;
    unlimitedUsers: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimit> = {
    free: {
        maxUsers: 1,
        maxObras: 1,
        maxCredits: 7,
        unlimitedObras: false,
        unlimitedUsers: false,
    },
    basic: {
        maxUsers: 3,
        maxObras: 2,
        maxCredits: 999999,
        unlimitedObras: false,
        unlimitedUsers: false,
    },
    professional: {
        maxUsers: 5,
        maxObras: 999999,
        maxCredits: 999999,
        unlimitedObras: true,
        unlimitedUsers: false,
    },
    master: {
        maxUsers: 15,
        maxObras: 999999,
        maxCredits: 999999,
        unlimitedObras: true,
        unlimitedUsers: false,
    },
    business: {
        maxUsers: 999999,
        maxObras: 999999,
        maxCredits: 999999,
        unlimitedObras: true,
        unlimitedUsers: true,
    },
};

export const getPlanLimits = (planType: string = 'free'): PlanLimit => {
    const normalizedPlan = planType.toLowerCase() as PlanType;
    return PLAN_LIMITS[normalizedPlan] || PLAN_LIMITS.free;
};
