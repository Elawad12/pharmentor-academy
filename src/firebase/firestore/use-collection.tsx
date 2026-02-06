'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirebase } from '../provider';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[];
  loading: boolean;
  error: FirestoreError | Error | null;
}

export function useCollection<T = any>(
    queryOrRef: Query | CollectionReference | null | undefined,
): UseCollectionResult<T> {
  const { loading: firebaseLoading, db } = useFirebase();
  const [data, setData] = useState<WithId<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!queryOrRef || !db) {
      // We are either not ready to query or firebase is not initialized
      setLoading(firebaseLoading);
      if (!firebaseLoading) {
        // if firebase is loaded but query is null, we are not in a loading state.
        setLoading(false);
      }
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      queryOrRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
        setData(results);
        setError(null);
        setLoading(false);
      },
      (err: FirestoreError) => {
        const path = queryOrRef.type === 'collection' ? (queryOrRef as CollectionReference).path : (queryOrRef as Query)._query.path.canonicalString();
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });
        setError(contextualError);
        setData([]);
        setLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [queryOrRef, firebaseLoading, db]);

  return { data, loading, error };
}
