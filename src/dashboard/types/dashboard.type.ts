import { ObjectId } from 'mongodb';

export class DashBoardResponse {
    _id?: ObjectId;
    ts: Date;
    userData: UserData
    userFeedback: UserFeedBack
};

export type UserData = {
    myId: string,
	device: string[],
    public: string,
    username: string,
};

export type UserFeedBack = {
    myRating: number,
    storeRating: number,
    ratingDate: Date,
};