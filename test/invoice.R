rm(inv1,inv2,inv3,sample,inv,test,p,pr,prf,invoice)
library(readr)
inv1 <- read_csv("D:/Proto/Invoice/test/guna.csv")
inv2 <-read_csv("D:/Proto/Invoice/test/jul.csv")
inv3 <- read_csv("D:/Proto/Invoice/test/aug.csv")

inv=rbind(subset(inv1,yrank<40),subset(inv2,yrank<40))

#invoice=glm(formula=Outcome~x+y+twidth+ws+clr+style+fsize+bold+txtmedian+yrel+yrank+len+Digital+static,data=inv1,family=binomial)
invoice=glm(formula=Outcome~style+fsize+bold+yrank,data=inv,family=binomial)
#invoice=glm(formula=Outcome~bold+yrank,data=inv,family=binomial)


sample <- read_csv("D:/Proto/Invoice/test/aug.csv")

print(summary(invoice))
anova(invoice, test="Chisq") 

library(ROCR)
p <- predict(invoice,newdata=sample,type="response")
pr <- prediction(p,sample$Outcome)
prf<-performance(pr,measure="tpr",x.measure="fpr")
p<-ifelse(p>0.5,1,0)
misClassificError<-mean(p!=sample$Outcome)
print(paste('Accuracy',1-misClassificError))
print(p)
print(pr)