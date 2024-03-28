import { createStore } from "jotai";

export let store = createStore();

export const resetStore = () => (store = createStore());
