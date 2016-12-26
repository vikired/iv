rm(inv1,inv2,inv3,sample,inv,test,p,pr,prf,invoice,resultindex)
library(readr)
inv1 <- read_csv("D:/Proto/Invoice/data/cleaned/guna.csv")
inv2 <-read_csv("D:/Proto/Invoice/data/cleaned/jul.csv")
inv3 <- read_csv("D:/Proto/Invoice/data/cleaned/aug.csv")

common_cols <- intersect(colnames(inv1), colnames(inv3),colnames(inv2))

inv=rbind(
  subset(inv1, select = common_cols), 
  subset(inv3, select = common_cols),
  subset(inv2, select = common_cols)
)
inv<-na.omit(inv)
frm=paste(colnames(inv),collapse = "+")

invoiceName=glm(formula=oName~bold+y+yrank+font,data=inv,family=binomial)
#invoiceName=randomForest(formula=oName~y+yrank+bold+font+mr,data=inv,ntree=500)
invoiceBillNo=glm(formula=oBillNo~y+xrank+yrank+bold+font+bill+number,data=inv,family=binomial)

print(summary(invoiceName))
anova(invoiceName, test="Chisq") 

print(summary(invoiceBillNo))
anova(invoiceBillNo, test="Chisq") 

line <- readline()

sample <- read_csv("D:/Proto/Invoice/data/cleaned/aug.csv")

#print(summary(invoiceName))
#anova(invoiceName, test="Chisq") 

library(ROCR)
pName <- predict(invoiceName,newdata=sample,type="response")
pr <- prediction(pName,sample$oName)
prf<-performance(pr,measure="tpr",x.measure="fpr")
print(pName)
pName<-ifelse(pName>0.5,1,0)
misClassificError<-mean(pName!=sample$oName)
print(paste('Accuracy',1-misClassificError))
resultindex=which(pName==1)
sample[resultindex:resultindex,]


pBillNo <- predict(invoiceBillNo,newdata=sample,type="response")
pr <- prediction(pBillNo,sample$oName)
prf<-performance(pr,measure="tpr",x.measure="fpr")
pBillNo<-ifelse(pBillNo==max(pBillNo),1,0)
print(pBillNo)
misClassificError<-mean(pBillNo!=sample$oBillNo)
print(paste('Accuracy',1-misClassificError))
resultindex=which(pBillNo==1)
sample[resultindex:resultindex,]