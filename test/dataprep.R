rm(raw)
library(readr)
raw <- read_csv("D:/Proto/Invoice/test/rawdata.csv")

# calculate yrank
getyrank=function(pdata)
{
  yrank=rank(pdata$y,na.last=TRUE, ties.method=c("average"))
  print(yrank)
  pdata=cbind(raw,yrank)
}

#calculate x rank
getxrank=function(pdata)
{
  newdata=pdata[0,]
  for(rank in pdata$yrank)
  {
    ydata=subset(pdata, yrank==rank)
    
    result=rank(ydata$x,na.last=TRUE, ties.method=c("average"))
    ydata=cbind(ydata,xrank=result)
    newdata=rbind(newdata,ydata)
  }
  return(newdata)
}

pdata=getyrank(raw)
pdata=getxrank(pdata)


print(pdata)