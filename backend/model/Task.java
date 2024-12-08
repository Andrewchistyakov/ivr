package model;

import java.util.Date;

public class Task {
    private String text;
    private int timeSpent;
    private int estTime;
    private int grade;
    private int rating;
    private Date dateWhenDone;
    private String subject;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getTimeSpent() {
        return timeSpent;
    }

    public void setTimeSpent(int timeSpent) {
        this.timeSpent = timeSpent;
    }

    public int getEstTime() {
        return estTime;
    }

    public void setEstTime(int estTime) {
        this.estTime = estTime;
    }

    public int getGrade() {
        return grade;
    }

    public void setGrade(int grade) {
        this.grade = grade;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public Date getDateWhenDone() {
        return dateWhenDone;
    }

    public void setDateWhenDone(Date dateWhenDone) {
        this.dateWhenDone = dateWhenDone;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }
}
