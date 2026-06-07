const ROOM_STATUS={
     WAITING: 'waiting',
     CLOSED:'closed',
     ACTIVE: 'active',
     COMPLETED: 'completed',
     CANCELLED:'cancelled'
}

const  ROOM_DIFFICULTY={
        EASY:'easy',
        MEDIUM:'medium',
        HARD:'hard'
}

const ROOM_MATCH_TIMERS = {
        TEN: 10,
        FIFTEEN: 15,
        TWENTY: 20,
        THIRTY: 30
}

const QUESTION_DIFFICULTY = {
        EASY:'easy',
        MEDIUM:'medium',
        HARD:'hard'
}

const LANGUAGES = {
        JS:"javascript",
        CPP:"C++",
        C:"C",
        JAVA:"java",
        PYTHON:"python",

}

const MATCH_STATUS = {
         WAITING:'waiting',
         COUNTDOWN:'countdown',
         CLOSED:'closed',
         ACTIVE:'active',
         COMPLETED:'completed',
         CANCELLED:'cancelled',
        
}

const MATCH_TYPE = {
        PROBLEM_SOLVING:'problem_solving',
        SPEEDCODING:'speedcoding',
}

const submissionStatus = {

        PENDING:'pending',
        RUNNING:'running',
        ACCEPTED:'accepted',
        WRONGANSWER:'wrong_answer',
        TIMEEXCEEDED:'time_exceeded',
        RUNTIMEERROR:'runtime_error',
        COMPILEERROR:'compile_error',
        INTERNALERROR:'internal_error',
        SYSTEMERROR:'system_error',
}

module.exports = {
  ROOM_STATUS,
  ROOM_DIFFICULTY,
  ROOM_MATCH_TIMERS,
  QUESTION_DIFFICULTY,
  LANGUAGES,
  MATCH_STATUS,
  MATCH_TYPE,
  submissionStatus
};
