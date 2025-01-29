import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'

let db: undefined | Database<sqlite3.Database, sqlite3.Statement>

export async function getDB() {
    if (!db) {
        db = await open({
            filename: 'db.sqlite',
            driver: sqlite3.Database,
            mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_SHAREDCACHE
        })
    }
    return db
}