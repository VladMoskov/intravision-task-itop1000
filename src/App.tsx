import {Button, Stack} from '@material-ui/core';
import React, {useEffect, useRef, useState} from 'react';
import {fromEvent, interval, Subject} from 'rxjs';
import {buffer, debounceTime, filter, map, takeUntil, tap} from "rxjs/operators";
import './index.css';

export const App: React.FC = () => {

    const wait = useRef<HTMLButtonElement | null>(null);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [ticker, setTicker] = useState<number>(0);
    const [isStarted, setIsStarted] = useState<boolean>(false);


    useEffect(() => {
        if (wait && wait.current) {
            const click$ = fromEvent<Event>(wait.current, 'click');
            const doubleClick$ = click$.pipe(
                buffer(click$.pipe(debounceTime(300))),
                map(clicks => clicks.length),
                filter(length => length === 2),
                tap(() => setIsPaused(true))
            )

            const subscribe$ = new Subject<number>();
            interval(1000)
                .pipe(
                    takeUntil(subscribe$),
                    takeUntil(doubleClick$)
                )
                .subscribe(() => {
                    !isPaused && isStarted && setTicker(v => v + 1000)
                });

            return () => {
                subscribe$.next();
                subscribe$.complete();
            };
        }
    }, [isStarted, isPaused]);

    const start = () => {
        if (isPaused) {
            setIsPaused(false)
        } else {
            setIsStarted(!isStarted);
            setTicker(0)
        }
    }

    const reset = () => {
        setTicker(0);
        setIsPaused(false)
    }

    return <div className={'wrapper'}>
        <h1>{new Date(ticker).toISOString().slice(11, 19)}</h1>

        <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={start}>Start/Stop</Button>
            <Button variant="contained" ref={wait}>Wait</Button>
            <Button variant="contained" onClick={reset}>Reset</Button>
        </Stack>
    </div>
}