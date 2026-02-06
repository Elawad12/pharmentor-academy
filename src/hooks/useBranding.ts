'use client';
import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Branding } from '@/lib/types';
import { useMemo } from 'react';
import { useFirebase } from '@/firebase/provider';

const BRANDING_DOC_ID = 'main';

export function useBranding() {
    const { db } = useFirebase();
    const brandingRef = useMemo(() => db ? doc(db, 'branding', BRANDING_DOC_ID) : null, [db]);
    const { data, loading, error } = useDoc<Branding>(brandingRef);

    const brandingData = useMemo(() => ({
        name: data?.name || 'PharMentor',
        logoUrl: data?.logoUrl,
    }), [data]);

    return { branding: brandingData, loading, error };
}
