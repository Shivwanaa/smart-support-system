from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import training
import joblib

import os
complain=[item[0] for item in training.TRAINING_DATA]
category=[item[1] for item in training.TRAINING_DATA]
priority=[item[2] for item in training.TRAINING_DATA]
'''classfying model'''
MODEL_PATH_CATEGORY="category_model.pkl"
MODEL_PATH_PRIORITY = "priority_model.pkl"
def classify_model():
    X_train,X_test,Y_train,Y_test=train_test_split(complain,category,test_size=0.2,random_state=42)
    cat_pipeline=Pipeline([("tfidf",TfidfVectorizer(ngram_range=(1,2),stop_words="english",max_features=5000)),("clf", LogisticRegression(max_iter=1000,C=1.0))])
    cat_pipeline.fit(X_train,Y_train)
    joblib.dump(cat_pipeline, MODEL_PATH_CATEGORY)
    priority_pipeline=Pipeline([("tfidf",TfidfVectorizer(ngram_range=(1,2),stop_words="english",max_features=5000)),("clf", LogisticRegression(max_iter=1000,C=1.0))])
    priority_pipeline.fit(X_train,Y_train)
    joblib.dump(priority_pipeline,MODEL_PATH_PRIORITY)

if not os.path.exists(MODEL_PATH_CATEGORY) or not os.path.exists(MODEL_PATH_PRIORITY):
    print("No saved models found — training now...")
    classify_model()
category_model=joblib.load(MODEL_PATH_CATEGORY)
priority_model=joblib.load(MODEL_PATH_PRIORITY)




