rm(inv1,inv2,inv3,sample,inv,test,p,pr,prf,invoice,resultindex)
library(readr)
inv1 <- read_csv("D:/Proto/Invoice/data/cleaned/guna.csv")
inv2 <-read_csv("D:/Proto/Invoice/data/cleaned/jul.csv")
inv3 <- read_csv("D:/Proto/Invoice/data/cleaned/aug.csv")

inv=rbind(inv1,inv3)

#invoice=glm(formula=Outcome~x+y+twidth+ws+clr+style+fsize+bold+txtmedian+yrel+yrank+len+Digital+static,data=inv1,family=binomial)
invoice=glm(formula=oName~yrank+bold+x+y,data=inv,family=binomial)
#invoice=glm(formula=Outcome~bold+yrank,data=inv,family=binomial)


sample <- read_csv("D:/Proto/Invoice/data/cleaned/shalaka.csv")

print(summary(invoice))
anova(invoice, test="Chisq") 

library(ROCR)
p <- predict(invoice,newdata=sample,type="response")
print(p)
pr <- prediction(p,sample$oName)
prf<-performance(pr,measure="tpr",x.measure="fpr")
p<-ifelse(p==max(p),1,0)
print(p)
misClassificError<-mean(p!=sample$oName)
print(paste('Accuracy',1-misClassificError))
print(pr)
resultindex=which(p==1)
sample[resultindex:resultindex,]